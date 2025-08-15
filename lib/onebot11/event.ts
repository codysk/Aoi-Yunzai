import type { Sendable } from "./message.ts";
import { Group } from "./group.ts";
import { User } from "./user.ts";

export interface MessageRet {
	message_id: string
}

export interface Event {
    post_type: string
    sub_type: string

	self_id: number

    echo?: string
}

export interface MessageEvent extends Event {
	/**
	 * 快速回复
	 * @param quote 引用这条消息(默认false)
	 */
	reply(content: Sendable | Sendable[], quote?: boolean): Promise<MessageRet>

    [key: string]: any
}

/** 私聊消息事件 */
export interface PrivateMessageEvent extends MessageEvent {
	/** 好友对象 */
	friend: User
}

/** 好友戳一戳事件 */
export interface FriendPokeEvent extends PrivateMessageEvent {
    /** 目标用户 */
    target_id: number
}

/** 群消息事件 */
export interface GroupMessageEvent extends MessageEvent {
	/** 快速撤回 */
	recall(): Promise<boolean>
	/** 群对象 */
	group: Group
}

/** 群戳一戳事件 */
export interface GroupPokeEvent extends GroupMessageEvent {
    /** 发送者 */
    user_id: number
    /** 目标用户 */
    target_id: number
}

export interface EventMap {
    "connected": [Event]
    
    /** 一般消息事件 */
    "message.private": [PrivateMessageEvent]
	/** 从好友 */
	"message.private.friend": [PrivateMessageEvent]
	/** 从群临时会话 */
	"message.private.group": [PrivateMessageEvent]
	/** 从其他途径 */
	"message.private.other": [PrivateMessageEvent]
	/** 从我的设备 */
	"message.private.self": [PrivateMessageEvent]
	/** 所有群消息 */
	"message.group": [GroupMessageEvent]
	/** 普通群消息 */
	"message.group.normal": [GroupMessageEvent]
	/** 匿名群消息 */
	"message.group.anonymous": [GroupMessageEvent]

	/** 所有消息 */
	"message": [PrivateMessageEvent | GroupMessageEvent]

	/** 好友戳一戳 */
	"notice.friend.poke": [FriendPokeEvent]
	/** 群戳一戳 */
	"notice.group.poke": [GroupPokeEvent]

}