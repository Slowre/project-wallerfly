import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';

import LLMBaseManager from './LLMBaseManager'


import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm'



import type { LLMParams, InferenceResult } from './LLMBaseManager'


export class LLMWebLLMManager extends LLMBaseManager {
    private engine: MLCEngine | null = null
    private contextData: any = null

    constructor(params: LLMParams) {
        super(params);
    }

    setContextData(data: any) {
        this.contextData = data;
    }

    async loadModel(): Promise<void> {
        if (this.engine) {
            console.log(`[WebLLM] Model ${this.modelName} already loaded.`);
            return;
        }

        console.log(`[WebLLM] Loading model ${this.modelName}...`);
        const initProgress = (pr: any) => console.log('Progress:', pr.text);
        this.engine = await CreateMLCEngine(this.modelName, {
            initProgressCallback: initProgress,
        });
        this.model = true
        console.log(`[WebLLM] Model ${this.modelName} loaded.`);

    }
    async unloadModel(): Promise<void> {
        if (!this.engine) {
            console.log('[WebLLM] No engine to unload.');
            return;
        }
        console.log(`[WebLLM] Unloading model ${this.modelName}...`);
        await this.engine.unload();
        this.engine = null;
        this.model = false
        console.log(`[WebLLM] Model ${this.modelName} unloaded.`);
    }

    async infer(prompt: string, temperatureUser: number, top_pUser: number): Promise<InferenceResult> {
        await this.ensureModelLoaded();

        if (!this.engine) throw new Error('Engine not loaded.');

        console.log(`[WebLLM] Inferring (sync): ${prompt}`);
        console.log(JSON.stringify(this.contextData['eventosAgrupados']))
        const promptFinal = `Reglas para interpretar:
- Cada objeto representa un mes, identificado en el campo "mes".
- Dentro de "eventos" hay varios registros. Cada evento tiene un "type" que puede ser:
  - "Ingreso": dinero que entra.
  - "Egreso": dinero que sale (gastos).
- El campo "amount" es el valor numérico que debe usarse para todos los cálculos.
- El campo "total" ya contiene la suma de amounts de ese mes, pero si es necesario valida sumando manualmente.
- Cuando el usuario hable de "gastos":
  - Considera únicamente los eventos con "type": "Egreso".
  - Ignora por completo los eventos con "type": "Ingreso".
- Cuando el usuario hable de "ingresos":
  - Considera únicamente los eventos con "type": "Ingreso".
  - Ignora por completo los eventos con "type": "Egreso".
- Siempre responde en español, de manera clara y breve.
- Si el usuario pide cálculos, usa los valores de "amount" dentro de los eventos.
- Usa saltos de línea para mostrar listas o desgloses de valores.

Pregunta del usuario: ${prompt}`;


        const messages: Array<ChatCompletionMessageParam> = [
            //{ role: 'system', content: this.systemPrompt },

            {
                role: 'system', content:

                    `${JSON.stringify(this.contextData['eventosAgrupados'])}`
            },
            { role: 'user', content: promptFinal },
        ];
        console.log(temperatureUser)
        console.log(top_pUser)
        const resp = await this.engine.chat.completions.create({
            messages,
            temperature: temperatureUser,
            top_p: top_pUser,
            max_tokens: 2000,
        });

        const text = resp.choices?.[0]?.message?.content ?? '';

        return { text };
    }

    async *stream(prompt: string): AsyncIterable<string> {
        await this.ensureModelLoaded();
        if (!this.engine) throw new Error('Engine not loaded.');

        console.log(`[WebLLM] Streaming: ${prompt}`);

        const messages: Array<ChatCompletionMessageParam> = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt },
        ];

        const streamIter = await this.engine.chat.completions.create({
            messages,
            temperature: this.temperature,
            max_tokens: 2000,
            stream: true,
        });

        for await (const chunk of streamIter) {
            const content = chunk.choices?.[0]?.delta?.content;

            if (content) yield content;
        }

    }




}

