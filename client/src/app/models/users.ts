export interface User {
    user_id: string;
    email: string;
    password?: string;
    firstName: string;
    lastname: string;
}

export interface UpdateUser {
    email: string;
    password?: string;
    forename: string;
    surname: string;
}