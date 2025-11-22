export interface UserDTO {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    keycloakId: string;
}
