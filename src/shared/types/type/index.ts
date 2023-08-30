import { ITax } from "../tax"

export interface IType {
  id?: number
  name: string
  taxes?: ITax[]
  created_at?: string
}
