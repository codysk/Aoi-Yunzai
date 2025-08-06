import fs from "fs";
import { Client } from "./client.ts";
import type { Sendable } from "./message.ts";
import { segment } from "./segment.ts";

export class User {
    public user_id: string;
    public nickname: string;
    public remark: string | null;
    
    private client: Client;
    constructor(client: Client, data: any) {
        this.client = client;
        this.user_id = data.user_id;
        this.nickname = data.nickname;
        this.remark = data.remark || null;
    }

    async sendMsg(message: Sendable | Sendable[]): Promise<any> {

        if (!Array.isArray(message)) {
            message = [message];
        }

        message = message.filter(m => !!m);
        message = message.map(m => {
            if (typeof m === "string") {
                return segment.text(m);
            }
            return m;
        });

        return await this.client.invoke("send_private_msg", {
            user_id: this.user_id,
            message: message
        });
    }

    makeForwardMsg(data: {user_id: number|string, nickname: string, message: Sendable[]}[]) {
        return this.client.makeForwardMsg(data);
    }

    async sendFile(path: string) {
        const filename = path.split("/").pop() || "file";
        const fileData = fs.readFileSync(path);
        return await this.client.invoke("send_private_msg", {
            user_id: this.user_id,
            message: segment.file(fileData, filename)
        });
    }
}