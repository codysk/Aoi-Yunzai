import fs from "fs";
import type { NodeElem, Sendable, TextElem, ReplyElem, AtElem} from "./message.ts";

export const segment = {
    text: (text: string): TextElem => {
        return {
            type: "text",
            data: {
                text: text
            }
        }
    },
    image: (file: string | Buffer) => {
        if (file instanceof Buffer) {
            file = "base64://" + file.toString('base64');
        }
        if (typeof file === "string" && file.startsWith("file://")) {
            const filePath = file.slice(7);
            if (fs.existsSync(filePath)) {
                const fileBuffer = fs.readFileSync(filePath);
                file = "base64://" + fileBuffer.toString('base64');
            } else {
                throw new Error(`File not found: ${filePath}`);
            }
        }
        return {
            type: "image",
            data: {
                file: file
            }
        }
    },
    node: (message: {user_id: string | number, nickname:string, content: Sendable[]}): NodeElem => {
        return {
            type: "node",
            data: message
        }
    },
    file: (file: string | Buffer, name: string) => {
        if (file instanceof Buffer) {
            file = "base64://" + file.toString('base64');
        }
        if (typeof file === "string" && file.startsWith("file://")) {
            const filePath = file.slice(7);
            if (fs.existsSync(filePath)) {
                const fileBuffer = fs.readFileSync(filePath);
                file = "base64://" + fileBuffer.toString('base64');
            } else {
                throw new Error(`File not found: ${filePath}`);
            }
        }
        return {
            type: "file",
            data: {
                file: file,
                name: name
            }
        }
    },
    reply: (id: number): ReplyElem => {
        return {
            type: "reply",
            data: {
                id: id
            }
        }
    },
    at: (qq: string): AtElem => {
        return {
            type: "at",
            data: {
                qq: qq
            }
        }
    }
}