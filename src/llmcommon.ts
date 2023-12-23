// @ts-ignore
import appConfig from "@/app-config";
import { ChatModule, type AppConfig, type InitProgressReport, type ModelRecord, ChatWorkerClient } from '@mlc-ai/web-llm';
import { parseMarkdown, highlight } from '@/mdcommon';
import { VCardItem } from "vuetify/components";

export default class Assistant {
    llmConfig!: AppConfig;
    chat!: ChatWorkerClient;

    public constructor() {
        this.llmConfig = appConfig;
        this.chat = new ChatWorkerClient(new Worker(
            new URL('@/llmworker.ts', import.meta.url),
            { type: 'module' }
        ));

        this.chat.setInitProgressCallback((report: InitProgressReport) => {
            Assistant.setLabel("init-label", report.text);
        });
    }

    public static setLabel(id: string, text: string) {
        const label = document.getElementById(id);
        if (label == null) {
            throw Error("Cannot find label " + id);
        }
        label.innerHTML = parseMarkdown(text) as string;
    }

    public static generateProgressCallback(itemId: string) {
        return (_step: number, message: string) => this.setLabel(itemId, message);
    };

    public modelList() {
        return appConfig.model_list.map((item: { local_id: any; }) => item.local_id);
    }

    public async reload(model: string) {
        //const model = "RedPajama-INCITE-Chat-3B-v1-q4f32_0";
        //const model = "TinyLlama-1.1B-Chat-v0.3-q4f32_0";
        await this.chat.reload(model, undefined, this.llmConfig);
    }

    public async prompt(prompt: string, itemId: string) {
        const reply = await this.chat.generate(prompt, Assistant.generateProgressCallback(itemId));
        return reply
    }

    public async explain(code: string, itemId: string) {
      const prompt = `${code}`;
      return await this.prompt(prompt, itemId);
    }
}
