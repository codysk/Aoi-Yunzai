import { EventEmitter } from "events";
import { WebSocket } from "ws";
import { User } from "./user.ts";
import { Group } from "./group.ts";
import type { NodeElem, Sendable } from "./message.ts";
import { segment } from "./segment.ts";
import type { Event, EventMap, GroupMessageEvent, PrivateMessageEvent, GroupPokeEvent, FriendPokeEvent } from "./event.ts";

export class Client extends EventEmitter<EventMap> {
    private active_ws: WebSocket | null;
    private config: any;
    
    public fl: Map<number, User>;
    public gl: Map<number, Group>;
    public uin: number | null;
    public nickname: string | null;

    private invokeEmitter: EventEmitter;
    
    constructor(config: any) {
        super();
        this.active_ws = null
        this.uin = null
        this.config = config
        this.nickname = null

        this.invokeEmitter = new EventEmitter()

        // 好友列表
        this.fl = new Map()
        // 群列表
        this.gl = new Map()
    }

    initializeConnection() {
        return new Promise<void>((resolve, reject) => {
            // reject if timeout
            const handle = setTimeout(() => {
                reject(new Error("WebSocket connection timeout"))
            }, 10000)

            this.once("connected", event => {
                this.uin = event.self_id
                clearTimeout(handle)
                resolve()
            })

            this.active_ws = new WebSocket(this.config.url)
            this.active_ws.on("open", () => {
                console.log(`[INFO] WebSocket connected to ${this.config.url}`)
            })
            this.active_ws.on("message", (data) => {
                this.eventRoute(data)
            })

            this.active_ws.on("close", (event) => {
                this.reconnect(event)
            })

            this.active_ws.on("error", (event) => {
                this.reconnect(event)
            })
        })
    }

    async start() {
        await this.initializeConnection()
        await this.getLoginInfo()
        await this.refreshFriendList()
        await this.refreshGroupList()
    }

    eventRoute(raw_message: string) {
        console.log(`[INFO] Received message: ${raw_message}`)
        try {
            const event: Event = JSON.parse(raw_message)
            if (event.sub_type === "connect") {
                this.emit("connected", event)
            }
            // Invoke Response
            if (event.echo && event.echo.startsWith("Invoke::")) {
                this.invokeEmitter.emit(event.echo, event)
            }

            // Message Event
            if (event.post_type === "message") {
                const message = event as PrivateMessageEvent | GroupMessageEvent;
                // protocol adapter
                if (message.message && Array.isArray(message.message)) {
                    for (const msg of message.message) {
                        if (!msg.data) continue
                        for (const key in msg.data) {
                            msg[key] = msg.data[key]
                        }
                    }
                }
                if (message.message_type === "private") {
                    // Private message
                    const user = this.pickUser(message.user_id)
                    if (user) {
                        message.friend = user
                    } else {
                        message.friend = new User(this, {
                            user_id: message.user_id,
                            nickname: message.sender.nickname,
                            remark: message.sender.remark || null
                        })
                    }

                    message.reply = async (content: Sendable | Sendable[], quote: boolean = false) => {
                        if (!quote) {
                            return await message.friend.sendMsg(content)
                        }
                        if (!Array.isArray(content)) {
                            content = [content]
                        }
                        // insert reply element at the beginning
                        content.unshift(segment.reply(message.message_id))
                        return await message.friend.sendMsg(content)
                    }

                } else if (message.message_type === "group") {
                    // Group message
                    const group = this.pickGroup(message.group_id)
                    if (group) {
                        message.group = group
                    } else {
                        message.group = new Group(this, {
                            group_id: message.group_id,
                            group_name: message.sender.group_name,
                            group_remark: message.sender.group_remark || null,
                            member_count: 0, // Placeholder, will be updated later
                            max_member_count: 0 // Placeholder, will be updated later
                        })
                    }
                    message.reply = async (content: Sendable | Sendable[], quote: boolean = false) => {
                        if (!quote) {
                            return await message.group.sendMsg(content)
                        }
                        if (!Array.isArray(content)) {
                            content = [content]
                        }
                        // insert reply element at the beginning
                        content.unshift(segment.reply(message.message_id))
                        return await message.group.sendMsg(content)
                    }
                    message.recall = async () => {
                        try {
                            await message.group.recallMsg(message.message_id)
                            return true
                        } catch (e) {
                            console.error("[ERROR] Failed to recall message:", e)
                            return false
                        }
                    }
                }
                this.em(`message.${message.message_type}.${message.sub_type ?? "normal"}`, message)
            }

            if (event.post_type === "notice") {
                if ((event as GroupPokeEvent).group_id) {
                    const pokeEvent = event as GroupPokeEvent;
                    pokeEvent.notice_type = "group"
                    const group = this.pickGroup(pokeEvent.group_id);
                    if (group) {
                        pokeEvent.group = group;
                    } else {
                        pokeEvent.group = new Group(this, {
                            group_id: pokeEvent.group_id,
                            group_name: "unknown",
                        });
                    }
                    this.em(`notice.group.poke`, pokeEvent);
                } else {
                    const pokeEvent = event as FriendPokeEvent;
                    pokeEvent.notice_type = "friend"
                    const user = this.pickUser(pokeEvent.user_id);
                    if (user) {
                        pokeEvent.friend = user;
                    } else {
                        pokeEvent.friend = new User(this, {
                            user_id: pokeEvent.user_id,
                            nickname: "unknown",
                        });
                    }
                    this.em(`notice.friend.poke`, pokeEvent);
                }                            
            }

        } catch (e) {
            console.error("[ERROR] Failed to parse message:", e)
            return
        }
    }

    reconnect(event) {
        console.log(`[INFO] WebSocket disconnected due to ${event}, reconnecting...`)
        this.active_ws?.terminate()
        this.initializeConnection()
    }

    invoke(action: string, params: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.active_ws?.readyState !== WebSocket.OPEN) {
                return reject(new Error("WebSocket is not open"))
            }

            const invokeId = `Invoke::${Date.now()}:${action}:{${Math.random().toString(16).slice(8)}}`

            const timeoutHandle = setTimeout(() => {
                this.invokeEmitter.removeAllListeners(invokeId)
                reject(new Error(`Invoke ${action} timeout`))
            }, 10000)
            this.invokeEmitter.once(invokeId, (response) => {
                clearTimeout(timeoutHandle)
                if (response.retcode !== 0) {
                    return reject(new Error(`Invoke ${action} failed: ${response.msg}`))
                }
                resolve(response.data)
            })
            this.active_ws.send(JSON.stringify({
                action: action,
                params: params,
                echo: invokeId
            }))
        })
    }

    async getLoginInfo() {
        let res: {[key: string]: any} = await this.invoke("get_login_info", {})
        this.uin = res.user_id
        this.nickname = res.nickname
    }

    async refreshFriendList() {
        let res: {[key: string]: any}[] = await this.invoke("get_friend_list", {})
        this.fl = new Map(res.map(friend => [friend.user_id, new User(
            this, 
            friend
        )]))
        return this.fl
    }

    pickUser(user_id: string|number): User | null {
        if (typeof user_id === "string") {
            user_id = parseInt(user_id);
        }
        return this.fl.get(user_id) || null;
    }

    async refreshGroupList() {
        let res: {[key: string]: any}[] = await this.invoke("get_group_list", {})
        this.gl = new Map(res.map(group => [group.group_id, new Group(this, group)]))
        return this.gl
    }

    pickGroup(group_id: string|number): Group | null {
        if (typeof group_id === "string") {
            group_id = parseInt(group_id);
        }
        return this.gl.get(group_id) || null;
    }

    async getGroupMemberInfo(group_id: string, user_id: string): Promise<User> {
        let res = await this.invoke("get_group_member_info", {
            group_id: group_id,
            user_id: user_id,
        });
        if (!res) {
            throw new Error(`Group member info not found for group_id: ${group_id}, user_id: ${user_id}`);
        }
        return new User(this, res);
    }

    makeForwardMsg(data: {user_id: number|string, nickname: string, message: Sendable[]}[]) {
        
        let ret: NodeElem[] = [];

        for (const item of data) {
            if (!item.user_id) {
                throw new Error("Invalid forward message data format");
            }
            if (!Array.isArray(item.message)){
                item.message = [item.message]; // Ensure message is an array
            }
            let forwardMessages = item.message.map(msg => {
                if (typeof msg === "string") {
                    return segment.text(msg); // Assuming a simple text segment
                }
                return msg;
            });
            ret.push(segment.node({
                user_id: item.user_id.toString(),
                nickname: item.nickname,
                content: forwardMessages,
            }));
        }
        
        return ret;
    }

    em(name = "", data?: any) {
        data = Object.defineProperty(data || {}, "self_id", {
            value: this.uin,
            writable: true,
            enumerable: true,
            configurable: true,
        });
        while (true) {
            (this as EventEmitter).emit(name, data);
            let i = name.lastIndexOf(".");
            if (i === -1)
                break;
            name = name.slice(0, i);
        }
    }
}