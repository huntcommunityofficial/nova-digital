"use client"

import { useState, useEffect } from "react";
import {  useParams, useRouter } from "next/navigation";
export default function deleteBlog(){
    const {id: urlId} = useParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    useEffect(()=>{
        const destroyBlog = async ()=>{
            if(!urlId) return;
            try{
                const res = await fetch(`http://localhost:8000/api/admin/blog/destroy/${urlId}`, {
                    method: 'DELETE',
                }
                );
                router.replace('/admin/blog');
            }catch{
                setError('Front error');
            }
        };
        destroyBlog();
    }, [urlId]
);
return(
    <>
    {error}
    </>
);
}