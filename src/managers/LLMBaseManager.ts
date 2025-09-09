export interface LLMParams {
    modelName: string
    temperature: number
    systemPrompt: string
}

export interface LLMOptions {
    [key: string]: any
}

export interface InferenceResult {
    text: string
}

const DEFAULT_SYSTEM_PROMPT = ''

export default abstract class LLMBaseManager {
    protected modelName: string
    protected temperature: number
    protected systemPrompt: string
    protected model: unknown

    constructor(params: LLMParams) {
        this.modelName = params.modelName
        this.temperature = params.temperature || 0.7
        this.systemPrompt = params.systemPrompt || DEFAULT_SYSTEM_PROMPT
        this.model = null
    }


    abstract loadModel(): Promise<void> | void

    abstract unloadModel(): Promise<void> | void

    abstract infer(prompt: string): Promise<InferenceResult>

    abstract stream(prompt: string): AsyncIterable<string>

    protected async ensureModelLoaded(): Promise<boolean> {
        if (!this.model) {
            await this.loadModel()
            return true
        }
        return false
    }

    async download(): Promise<boolean> {
        return this.model as boolean;
    }
}