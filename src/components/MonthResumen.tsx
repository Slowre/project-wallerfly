import type { EventoType } from "@/types/Evento"

import 'dayjs/locale/es';
import MonthTotal from "./MonthTotal";
import Event from "./Event";

type MonthsResumenProps = {
    date: string
    events: EventoType[]
    total: number
}
export default function MonthsResumen(props: MonthsResumenProps) {
    const { date, events, total } = props

    return (
        <article className="p-4 h-full flex flex-col">
            <div className="bg-white rounded-md shadow-lg w-[300px] h-full flex flex-col flex-1 dark:bg-gray-600">

                <div className="flex flex-col justify-between">
                    <div className="my-auto">
                        <h3 className="text-gray-800 font-semibold text-lg py-3 dark:text-gray-300">{date}</h3>
                        <div className="w-full border-1 border-gray-200"></div>
                        <section className="px-2 flex-1 mb-auto max-h-[250px] overflow-y-auto">
                            {events.map((event) => (
                                <Event
                                    key={event.id}
                                    event={event}
                                />

                            ))}
                        </section>
                    </div>

                    <footer className="p-2 my-auto flex-1">
                        <MonthTotal
                            events={events}
                            total={total}
                        />

                    </footer>

                </div>
                <div></div>

            </div>
        </article>
    )
}