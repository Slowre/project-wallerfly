import { useState } from "react";
import { MessageCircle, X, Settings2 } from "lucide-react";


type FloatingChatProps = {
    isChatOn: boolean;
    userPrompt: string;
    setUserPrompt: (value: string) => void;
    messages: { role: 'user' | 'bot'; content: string }[];
    isPending: boolean;
    onSendPrompt: (prompt: string, temperatureUser: number, top_pUser: number) => void;

}


export default function FloatingChat({ isChatOn,
    userPrompt,
    setUserPrompt,
    messages,
    isPending,
    onSendPrompt, }: FloatingChatProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [open, setOpen] = useState(false);
    const [tempe, setTempe] = useState(0)
    const [topp, setTopp] = useState(0.1)

    const handleTempe = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempe(+e.target.value)
    }
    const handleTopp = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopp(+e.target.value)
    }

    const handleSend = () => {
        if (!userPrompt.trim()) return;
        onSendPrompt(userPrompt, tempe, topp);
    };

    return (
        <>

            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 bg-violet-600 text-white p-4 rounded-full shadow-xl hover:bg-violet-700 transition z-50 cursor-pointer"
            >
                {open ? <X size={24} /> : <MessageCircle size={24} />}
            </button>


            {open && (
                <div className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl flex flex-col z-40">

                    <div className="relative p-3 bg-violet-600 dark:bg-pink-500 text-white font-bold rounded-t-2xl flex justify-center items-center">
                        <span>Asistente IA</span>
                        <Settings2 className="absolute right-3 cursor-pointer" onClick={() => setShowSettings(!showSettings)} />
                    </div>

                    <div className={` bg-gray-100 border-b-1 border-gray-200 overflow-hidden transition-all duration-500 ${showSettings ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                        <div>
                            <div className='flex items-center '>
                                <label className={`px-2 text-blue-700 font-semibold `}>Temperature</label>
                                <input type="range" name="temp" id="temp" min="0" max="2" step="0.1" onChange={handleTempe} value={tempe} />
                                <label className='px-2 text-neutral-600 font-semibold w-[4ch]'>{tempe}</label>
                            </div>
                            <div className='flex items-center'>
                                <label className={`px-2 font-semibold text-blue-700`}>Top-p</label>
                                <input type="range" name="topp" id="topp" min="0.1" max="1" step="0.1" onChange={handleTopp} value={topp} />
                                <label className={`px-2 font-semibold  text-gray-800 w-[4ch]`}>{topp}</label>
                            </div>
                        </div>

                    </div>

                    <div className="flex-1 p-3 overflow-y-auto scr text-sm text-gray-700 dark:text-gray-200">
                        {!isChatOn && (
                            <div className="text-center text-gray-500 italic">Modelo AI cargando...</div>
                        )}

                        {messages.length === 0 && isChatOn && (
                            <div className="text-center text-gray-400">¡Escribe un mensaje para comenzar!</div>
                        )}

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`my-2
                                            max-w-3xs
                                            p-3 rounded-lg
                                            ${msg.role === 'user'
                                        ? 'bg-violet-200 text-gray-800 self-end ml-auto text-end'
                                        : 'bg-gray-200 text-gray-800 self-start mr-auto dark:bg-gray-700 dark:text-white text-start'
                                    }
                                `}
                            >
                                {msg.content}
                            </div>
                        ))}


                        {/* <div className="mb-2">{!isChatOn ? `Modelo AI cargando` : ``} {response || <span className="text-gray-400">Aún no hay respuesta...</span>}</div> */}
                    </div>


                    <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex flex-row" >
                        <textarea
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            placeholder={!isChatOn ? `Modelo AI cargando` : `Escribe un mensaje...`}
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                            disabled={!isChatOn}
                            rows={2}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isPending || !userPrompt.trim()}
                            className="bg-violet-600 text-white px-3 py-2 mx-1 rounded hover:bg-blue-700 disabled:opacity-50 h-fit"
                        >
                            {isPending ? '...' : 'Enviar'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}