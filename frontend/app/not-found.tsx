import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
export default function NotFound(){
    return(
        <>
        <div className="w-full h-[70vh] mt-10 flex justify-center items-center ">
            <p className="text-white text-center">
                <span className="text-6xl">Eror 404</span>
                <br />
                <br />
                <span className="text-2xl">Page not found</span>
            </p>
        </div>
        </>
    );
};