<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'message' => 'Data fetched successfully',
            'data' => $blogs,
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'min_content' => 'required|string',
            'max_content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('blogs', 'public');
        }

        $blog = Blog::create([
            'title' => $request->title,
            'min_content' => $request->min_content,
            'max_content' => $request->max_content,
            'image' => $imagePath,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Created successfully',
            'data' => $blog,
        ], 201);
    }

    public function show(Blog $blog)
    {
        return response()->json([
            'status' => true,
            'message' => 'Item retrieved successfully',
            'data' => $blog,
        ], 200);
    }

    public function edit(Blog $blog)
    {
        return response()->json([
            'status' => true,
            'message' => 'Item is ready for editing',
            'data' => $blog,
        ], 200);
    }

    public function update(Request $request, Blog $blog)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'min_content' => 'sometimes|string',
            'max_content' => 'sometimes|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $data = $request->only(['title', 'min_content', 'max_content']);

        if ($request->input('remove_image') && $blog->image) {
            Storage::disk('public')->delete($blog->image);
            $data['image'] = null;
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($blog->image) {
                Storage::disk('public')->delete($blog->image);
            }
            $data['image'] = $request->file('image')->store('blogs', 'public');
        }

        $blog->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Updated successfully',
            'data' => $blog,
        ]);
    }

    public function destroy(Blog $blog)
    {
        if ($blog->image) {
            Storage::disk('public')->delete($blog->image);
        }

        $blog->delete();

        return response()->json([
            'status' => true,
            'message' => 'Deleted successfully',
        ]);
    }
}
