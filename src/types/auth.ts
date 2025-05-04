export interface ResponseModel<T> {
    code: number;
    data: T;
    msg?: string;
}
