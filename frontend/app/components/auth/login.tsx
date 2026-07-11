"use client";

import api from "@/app/lib/api";
import { faEye, faEyeSlash, faCircleExclamation, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<boolean | string>("");
    const [successMessage, setSuccessMessage] = useState("");

    const searchParams = useSearchParams();
    const authRequired = searchParams.get("reason") === "auth";


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post("/api/login", {
                email,
                password,
            });
            setError(false);
            setSuccessMessage("Login successful. You will be redirected shortly.");
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
        } catch (error) {
            setError("Invalid email or password.");
        }
    };

    useEffect(() => {
        api.get("/api/user")
            .then(() => router.replace("/dashboard"))
            .catch(() => { });
    }, []);

    return (
        <section className="relative overflow-hidden py-28 px-4">
            <div className="relative max-w-7xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div
                        className="w-full max-w-md sm:max-w-lg mx-auto grid gap-y-8 px-6 sm:px-8 py-10 rounded-xl border border-white bg-black/20 backdrop-blur-2xl"
                    >
                        <h2 className="text-white text-3xl font-bold text-center">
                            Login
                        </h2>

                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 rounded-lg border border-white bg-white/10 text-white placeholder:text-gray-300 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3 pr-14 rounded-lg border border-white bg-white/10 text-white placeholder:text-gray-300 outline-none
                                "
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition
                                "
                            >
                                {showPassword ? (
                                    <FontAwesomeIcon icon={faEyeSlash} />
                                ) : (
                                    <FontAwesomeIcon icon={faEye} />
                                )}
                            </button>
                        </div>
                        {error && (
                            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3">
                                <FontAwesomeIcon icon={faCircleExclamation} className="text-red-400 text-base flex-shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-3">
                                <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-base flex-shrink-0" />
                                <p className="text-emerald-400 text-sm">{successMessage}</p>
                            </div>
                        )}

                        {authRequired && !error && (
                            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3">
                                <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-400 text-base flex-shrink-0" />
                                <p className="text-amber-400 text-sm">Please log in to place an order.</p>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <input
                                type="submit"
                                value="Login"
                                className="py-3 px-10 rounded-lg bg-blue-500 text-white hover:bg-blue-700 transition duration-300 cursor-pointer
                                "
                            />
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}