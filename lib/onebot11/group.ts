import fs from "fs";
import { Client } from "./client.ts";
import type { Sendable } from "./message.ts";
import { segment } from "./segment.ts";
import type { MessageRet } from "./event.ts";

export class Group {
    public group_id: string;
    public group_name: string;
    public group_remark: string | null;
    public member_count: number;
    public max_member_count: number;
    public group_all_shut: number;

    public name: string;
    
    private client: Client;
    
    constructor(client: Client, data: any) {
        this.client = client;
        this.group_id = data.group_id;
        this.group_name = data.group_name;
        this.group_remark = data.group_remark || null;
        this.member_count = data.member_count;
        this.max_member_count = data.max_member_count;
        this.group_all_shut = data.group_all_shut || 0; // Default to 0 if not provided

        this.name = this.group_name || this.group_remark || `Group ${this.group_id}`;
    }

    async sendMsg(message: Sendable | Sendable[]): Promise<MessageRet> {
        if (!Array.isArray(message)) {
            message = [message];
        }

        message = message.map(m => {
            if (typeof m === "string") {
                return { type: "text", data: { text: m } }; // Assuming a simple text segment
            }
            return m;
        });

        let result =  await this.client.invoke("send_group_msg", {
            group_id: this.group_id,
            message: message
        });
        if (!result || result.retcode !== 0) {
            throw new Error(`send_msg failed for group_id: ${this.group_id}, message: ${message}`);
        }
        return result.data
    }

    async recallMsg(message_id: number): Promise<any> {
        let result = await this.client.invoke("delete_msg", {
            message_id: message_id
        });
        if (!result || result.retcode !== 0) {
            throw new Error(`recall_msg failed for message_id: ${message_id}`);
        }
        return result.data;
    }

    makeForwardMsg(data: {user_id: number|string, nickname: string, message: Sendable[]}[]) {
        return this.client.makeForwardMsg(data);
    }

    async sendFile(path: string) {
        const filename = path.split("/").pop() || "file";
        const fileData = fs.readFileSync(path);
        return await this.client.invoke("send_group_msg", {
            group_id: this.group_id,
            message: segment.file(fileData, filename)
        });
    }
}