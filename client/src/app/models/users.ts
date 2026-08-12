export interface User {
    id: string;
    email: string;
    password?: string;
    firstName: string;
    lastname: string;
    currency?: string;
}

export interface NewUser {
    email: string;
    password: string;
    firstName: string;
    lastname: string;
    currency: string;
}

export interface UpdateUser {
    email: string;
    password?: string;
    firstName: string;
    lastname: string;
}