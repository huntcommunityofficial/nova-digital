import Login from '@/app/components/auth/login';
import SectionBg from '@/app/components/ui/sectionBg';
import { Suspense } from "react";

export default function login() {
    return (
        <>
            <SectionBg />
            <Suspense>
                <Login />
            </Suspense>
        </>
    );
}