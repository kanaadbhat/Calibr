export interface User {
    id?: string;
    name: string;
    email: string;
}

export interface UserState {
    user: User | null;
    isAuth: boolean;
    login: (user: User) => void;
    logout: () => void;
}