import { getUserById } from "../repositories/users.repository.js";
import { User } from "../schemas/users.schema.js";
import HttpErrors from "http-errors";

export const userTest = async (id: number): Promise<User> => {
    const user = await getUserById(id);
    if (!user) throw HttpErrors(404, "사용자가 없습니다.");
    return user;
};
