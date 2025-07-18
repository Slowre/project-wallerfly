import type { EventoType } from "@/types/Evento"
import type { Dayjs } from "dayjs"
import Event from "./event"
import 'dayjs/locale/es';
import MonthTotal from "./MonthTotal";

type MonthsResumenProps = {
    date: string
    events: EventoType[]
    total:number
}
export default function MonthsResumen(props: MonthsResumenProps) {
    const { date, events,total } = props

    return (
        <article className="p-4  h-full">
            <div className="bg-white rounded-md shadow-lg w-[300px]  h-full">
                <div className="flex flex-col gap-2 justify-between">
                    <div>
                        <h3 className="text-gray-800 font-semibold text-lg">{date}</h3>
                        <div className="w-full border-1 border-gray-200"></div>
                        <div className="px-2 flex-1 overflow-auto">
                            {events.map((event) => (
                                <Event
                                    key={event.id}
                                    event={event}
                                />

                            ))}
                        </div>
                        <div className="p-2 mt-auto">
                            <MonthTotal
                                events={events}
                                total={total}
                            />

                        </div>

                    </div>
                    <div></div>
                </div>
            </div>
        </article>
    )
}