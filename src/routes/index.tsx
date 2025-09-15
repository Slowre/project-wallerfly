import { createFileRoute, Link } from '@tanstack/react-router'
import '../App.css'
import { cn } from '@/utils/styles'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DataRepo from '@/api/datasource';
import MonthsResumen from '@/components/MonthResumen';
import type { EventoType } from '@/types/Evento';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es'
import SetDineroInicial from '@/components/SetDineroInicial';
import type { DineroCreate } from '@/types/Dinero';
import type LLMBaseManager from '@/managers/LLMBaseManager';
import { LLMWebLLMManager } from '@/managers/LLMWebLLMManager';
import FloatingChat from '@/components/FloatingChat';
import type { InferenceResult } from '@/managers/LLMBaseManager';

export const Route = createFileRoute('/')({
  component: App,
})

const CONFIG = {
  webLLM: { 
    modelName: 'Qwen2-1.5B-Instruct-q4f16_1-MLC', // Modelo de ejemplo para web-llm gemma-2-2b-it-q4f16_1-MLC Qwen2-0.5B-Instruct-q4f16_1-MLC Qwen2-1.5B-Instruct-q4f16_0-MLC
  }
};

type AgrupacionMensual = {
  mes: string;
  eventos: EventoType[];
  total: number;
};

type Message = {
  role: 'user' | 'bot'
  content: string
}

type LLMParamsInfer = {
  prompt: string
  temperatureUser: number
  top_pUser: number
}

function App() {




  dayjs.locale("es");

  const [llmManager, setLlmManager] = useState<LLMBaseManager | null>(null);
  const [isChatOn, setIsChatOn] = useState(false);

  const [userPrompt, setUserPrompt] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  const [dineroInicial, setDineroInicial] = useState(0);
  const [eventosAgrupados, setEventosAgrupados] = useState<AgrupacionMensual[]>([]);

  const queryClient = useQueryClient();

  const { isPending, error, data: events } = useQuery({
    queryKey: ['events'],
    queryFn: () => DataRepo.getEvents(),
    refetchInterval: 2000, // Refetch every 2 seconds
    refetchOnWindowFocus: true, // Refetch when the window is focused
    retry: 3, // Retry failed requests up to 3 times
    refetchIntervalInBackground: false, // Do not refetch in the background
  })

  const { data: dinero } = useQuery({
    queryKey: ['money'],
    queryFn: () => DataRepo.getMoney(),
    refetchInterval: 2000, // Refetch every 2 seconds
    refetchOnWindowFocus: true, // Refetch when the window is focused
    retry: 3, // Retry failed requests up to 3 times
    refetchIntervalInBackground: false, // Do not refetch in the background
  })


  const mutation = useMutation({
    mutationFn: (values: DineroCreate) => DataRepo.saveMoney(values),
  })


  const inferMutation = useMutation({
    mutationFn: async ({ prompt, temperatureUser, top_pUser }: LLMParamsInfer) => {
      if (!llmManager) throw new Error("LLM Manager not initialized.");
      //setResponse(prompt + "<br>"); // Limpiar respuesta anterior
      setMessages(prev => [...prev, { role: 'user', content: prompt }]);
      // setStreamingResponse(''); // Limpiar streaming anterior


      return llmManager.infer(prompt, temperatureUser, top_pUser);
    },
    onSuccess: function (data: InferenceResult) {
      //setResponse((prev) => prev + data.text);
      setMessages(prev => [...prev, { role: 'bot', content: data.text }]);
      //queryClient.invalidateQueries(['llmResponse']); // Invalidar para actualizar si fuera necesario

      queryClient.invalidateQueries({
        queryKey: ['llmResponse']
      })
      setUserPrompt('')

    },
    onError: (error) => {
      console.error('Inference error:', error);
    }
  });




  useEffect(() => {
    const initializeManager = async () => {
      let manager: LLMBaseManager;

      manager = new LLMWebLLMManager({
        modelName: CONFIG.webLLM.modelName,
        temperature: 0.7,
        systemPrompt: 'Eres un asistente IA para continuar una conversación'
      });
      setLlmManager(manager);
      await manager.loadModel(); // Cargar modelo automáticamente al iniciar

      if (await manager.download) {
        console.log('Ya esta cargado el modelo')
        setIsChatOn(true)
      }
    };

    initializeManager();

  }, []);

  useEffect(() => {
    return () => {
      if (llmManager) {
        console.log("🛑 Descargando modelo...");
        llmManager.unloadModel();
      }
    };
  }, [llmManager]);


  useEffect(() => {
    if (dinero) {
      setDineroInicial(dinero.money)
    }
  }, [dinero])


  useEffect(() => {
    if (events && dineroInicial) {
      const eventsOrdenados = [...events].sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
      );

      const agrupados: Record<string, EventoType[]> = {};

      eventsOrdenados.forEach((evento) => {
        const key = dayjs(evento.date).format('MMMM YYYY');
        if (!agrupados[key]) agrupados[key] = [];
        agrupados[key].push(evento);
      });

      const resultado: AgrupacionMensual[] = [];

      let saldoActual = dineroInicial;

      Object.entries(agrupados).forEach(([mes, eventos]) => {
        const totalMes = eventos.reduce((acc, evento) => {
          return acc + (evento.type === 'Ingreso' ? evento.amount : -evento.amount);
        }, 0);

        const saldoInicial = saldoActual;
        const saldoFinal = saldoInicial + totalMes;
        saldoActual = saldoFinal

        resultado.push({
          mes,
          eventos,
          total: saldoFinal
        });
      });
      resultado.reverse()
      setEventosAgrupados(resultado);
    }
  }, [events, dineroInicial])

  useEffect(() => {
    if (llmManager) {
      llmManager.setContextData({
        dineroInicial,
        eventosAgrupados,
      });
    }
  }, [llmManager, dineroInicial, eventosAgrupados]);



  const onSendPrompt = (prompt: string, temperatureUser: number, top_pUser: number) => {
    inferMutation.mutate({ prompt, temperatureUser, top_pUser });
  };

  const aumentarDinero = (cantidad: number) => {
    const nuevoDinero: DineroCreate = { money: cantidad }
    mutation.mutate(nuevoDinero)
  }

  const erraseMessages = ()=>{
    setMessages([])
  }





  if (isPending) {
    return <div className="p-4">Loading...</div>
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>
  }

  // const [streamingResponse, setStreamingResponse] = useState<string>('');


  // const [eventosAgrupados, setEventosAgrupados] = useState<[string, EventoType[]][]>([]);




  return (
    <div className="App">
      <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
        <SetDineroInicial
          dineroInicial={dineroInicial}
          dineroAnadir={aumentarDinero}
        />

        <div className='w-full text-2xl text-gray-700 font-bold text-center dark:text-gray-300'>
          Su Monto Inicial: <span className="text-violet-500 dark:text-pink-500">{dineroInicial}</span>
        </div>

        <Link
          to='/event/form'
          className={cn('bg-violet-600 w-full text-white h-fit rounded px-3 py-2 shadow-xl hover:bg-violet-700 md:w-64 dark:bg-pink-500 dark:hover:bg-pink-600')}
        >
          Add Event
        </Link>
      </div>
      <div className="p-4">
        <div className="flex flex-row flex-wrap items-stretch justify-center">
          {eventosAgrupados.length != 0 && eventosAgrupados.map((item, indice) => (
            <MonthsResumen key={indice} date={item.mes} events={item.eventos} total={item.total} />
          ))}
          {eventosAgrupados.length == 0 && <div className="text-center text-gray-500">No hay eventos</div>}

        </div>
      </div>
      <FloatingChat messages={messages} isChatOn={isChatOn} userPrompt={userPrompt} setUserPrompt={setUserPrompt} onSendPrompt={onSendPrompt} isPending={inferMutation.isPending} erraseMessages={erraseMessages}/>
    </div>
  )
}
