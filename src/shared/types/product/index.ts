import { IType } from '../type'

export interface IProduct {
  id?: number
  name: string
  price: number
  type?: IType
  type_id?: number
  total_tax?: number
  created_at?: string
}
