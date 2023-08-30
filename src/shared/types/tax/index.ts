import { IType } from "../type"

export interface ITax {
  id?: number
  name: string
  type?: IType
  type_id?: number
  rate: number
  created_at?: string
}
