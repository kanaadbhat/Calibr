import { persist } from "zustand/middleware";
import { create } from "zustand";
import { User, UserState } from "./user.types";

const userStore = create<UserState>()(
    persist<UserState>(
        (set) => ({
            user: null,
            isAuth: false,
            login: (user: User) => set(() => ({ user, isAuth: true })),
            logout: () => set(() => ({ user: null, isAuth: false })),
        }),
        {
            name: "user-storage",
        }
    )
);
export { userStore };