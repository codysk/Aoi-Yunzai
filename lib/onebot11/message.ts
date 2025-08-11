export type Sendable = string | TextElem | ImageElem | NodeElem | FileElem | ReplyElem;
export interface TextElem {
    type: "text";
    data: {
        text: string;
    };
};
export interface ImageElem {
    type: "image";
    data: {
        file: string;
    };
};

export interface NodeElem {
    type: "node";
    data: { user_id: string | number; nickname: string; content: Sendable[] };
    news?: {text: string}[];
};

export interface FileElem {
    type: "file";
    data: {
        file: string;
        name: string;
    };
};

export interface ReplyElem {
    type: "reply";
    data: {
        id: number;
    };  
};
