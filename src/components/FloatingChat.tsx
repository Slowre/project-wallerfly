import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

type FloatingChatProps = {

    isChatOn: boolean
}



export default function FloatingChat({ isChatOn }: FloatingChatProps) {
    const [open, setOpen] = useState(false);

    return (
        <>

            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 bg-violet-600 text-white p-4 rounded-full shadow-xl hover:bg-violet-700 transition z-50"
            >
                {open ? <X size={24} /> : <MessageCircle size={24} />}
            </button>


            {open && (
                <div className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl flex flex-col z-40">

                    <div className="p-3 bg-violet-600 dark:bg-pink-500 text-white font-bold rounded-t-2xl">
                        Mini Chat
                    </div>


                    <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200">
                        <div className="mb-2">{!isChatOn?`Modelo AI cargando`:`👋 Hola, ¿en qué puedo ayudarte?`}</div>
                    </div>


                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <input
                            type="text"
                            placeholder={!isChatOn?`Modelo AI cargando`:`Escribe un mensaje...`}
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                            disabled={!isChatOn}
                        />
                    </div>
                </div>
            )}
        </>
    );
}