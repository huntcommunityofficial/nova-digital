<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Services\PricingCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function __construct(private PricingCalculator $pricing) {}

    /**
     * Create a new order (used by all 4 service pages).
     */
    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();

        $price = $this->pricing->calculate($data['service'], $data['details']);

        $order = Order::create([
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'user_id' => auth()->id(),
            'service' => $data['service'],
            'client_name' => $data['client_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'price' => $price,
            'status' => $price === null ? 'quote_requested' : 'awaiting_payment',
            'details' => $data['details'],
        ]);

        return response()->json([
            'message' => $price === null ? 'Quote request received.' : 'Order placed successfully.',
            'order_number' => $order->order_number,
            'price' => $price,
            'status' => $order->status,
        ], 201);
    }

    /**
     * Admin: list all orders (summary fields only).
     */
    public function index()
    {
        $orders = Order::orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'service' => $order->service,
                'client_name' => $order->client_name,
                'email' => $order->email,
                'price' => $order->price,
                'status' => $order->status,
                'created_at' => $order->created_at,
            ]);

        return response()->json($orders);
    }

    /**
     * Logged-in user: list their own orders (summary fields only).
     */
    public function myOrders()
    {
        $orders = Order::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'service' => $order->service,
                'price' => $order->price,
                'status' => $order->status,
                'created_at' => $order->created_at,
            ]);

        return response()->json($orders);
    }

    /**
     * View a single order's full details.
     * Accessible by the order's owner or an admin.
     */
    public function show(Order $order)
    {
        if ($order->user_id !== auth()->id() && ! auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'id' => $order->id,
            'order_number' => $order->order_number,
            'service' => $order->service,
            'client_name' => $order->client_name,
            'email' => $order->email,
            'phone' => $order->phone,
            'price' => $order->price,
            'status' => $order->status,
            'details' => $order->details,
            'receipt_path' => $order->receipt_path,
            'receipt_status' => $order->receipt_status,
            'receipt_note' => $order->receipt_note,
            'deliverable_path' => $order->deliverable_path,
            'created_at' => $order->created_at,
        ]);
    }

    /**
     * Admin: set price / change status.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $data = $request->validated();

        if (isset($data['price'])) {
            $order->price = $data['price'];
            $order->status = 'quoted';
        }

        if (isset($data['status'])) {
            $order->status = $data['status'];
        }

        $order->save();

        return response()->json([
            'message' => 'Order updated successfully.',
            'order' => $order,
        ]);
    }

    /**
     * User: confirm a quote (quoted -> awaiting_payment).
     */
    public function confirm(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($order->status !== 'quoted') {
            return response()->json(['message' => 'Order cannot be confirmed at this stage.'], 422);
        }

        $order->update(['status' => 'awaiting_payment']);

        return response()->json(['message' => 'Order confirmed.', 'order' => $order]);
    }

    /**
     * User: reject a quote (quoted -> rejected).
     */
    public function reject(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($order->status !== 'quoted') {
            return response()->json(['message' => 'Order cannot be rejected at this stage.'], 422);
        }

        $order->update(['status' => 'rejected']);

        return response()->json(['message' => 'Order rejected.', 'order' => $order]);
    }

    /**
     * Admin: delete an order.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully.']);
    }

    /**
     * User uploads payment receipt.
     */
    public function uploadReceipt(Request $request, Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($order->status !== 'awaiting_payment') {
            return response()->json(['message' => 'Order is not awaiting payment.'], 422);
        }

        $request->validate([
            'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB
        ]);

        // Delete old receipt if exists
        if ($order->receipt_path) {
            Storage::disk('public')->delete($order->receipt_path);
        }

        $path = $request->file('receipt')->store('receipts', 'public');

        $order->update([
            'receipt_path' => $path,
            'receipt_status' => 'pending',
            'receipt_note' => null,
        ]);

        return response()->json([
            'message' => 'Receipt uploaded successfully.',
            'receipt_status' => 'pending',
            'receipt_path' => $path,
        ]);
    }

    /**
     * Admin approves or rejects a receipt.
     */
    public function reviewReceipt(Request $request, Order $order)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'note' => 'nullable|string|max:500',
        ]);

        if ($order->receipt_status !== 'pending') {
            return response()->json(['message' => 'No pending receipt to review.'], 422);
        }

        if ($request->action === 'approve') {
            $order->update([
                'receipt_status' => 'approved',
                'status' => 'in_progress',
                'receipt_note' => null,
            ]);
        } else {
            $order->update([
                'receipt_status' => 'rejected',
                'receipt_note' => $request->note ?? 'Receipt was rejected.',
            ]);
        }

        return response()->json(['message' => 'Receipt reviewed.', 'order' => $order]);
    }

    /**
     * Admin uploads the final deliverable file.
     */
    public function uploadDeliverable(Request $request, Order $order)
    {
        $request->validate([
            'deliverable' => 'required|file|max:51200', // 50MB
        ]);

        // Delete old deliverable if exists
        if ($order->deliverable_path) {
            Storage::disk('public')->delete($order->deliverable_path);
        }

        $path = $request->file('deliverable')->store('deliverables', 'public');

        $order->update([
            'deliverable_path' => $path,
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Deliverable uploaded. Order marked as completed.',
            'deliverable_path' => $path,
        ]);
    }

    public function deleteReceipt(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (! in_array($order->receipt_status, ['pending', 'rejected'])) {
            return response()->json(['message' => 'Cannot delete this receipt.'], 422);
        }

        if ($order->receipt_path) {
            Storage::disk('public')->delete($order->receipt_path);
        }

        $order->update([
            'receipt_path' => null,
            'receipt_status' => null,
            'receipt_note' => null,
        ]);

        return response()->json(['message' => 'Receipt deleted.']);
    }

    public function deleteDeliverable(Order $order)
    {
        if ($order->deliverable_path) {
            Storage::disk('public')->delete($order->deliverable_path);
        }

        $order->update([
            'deliverable_path' => null,
            'status' => 'in_progress',  // ← اینجا in_progress میذاره نه awaiting_payment
        ]);

        $order->refresh();

        return response()->json(['message' => 'Deliverable deleted.', 'order' => $order]);
    }
}
