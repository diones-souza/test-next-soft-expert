import { IProduct } from "../product"

export interface ISale {
  id?: number
  products: ISaleProduct[]
  created_at?: string
}

export interface ISaleProduct {
  id?: number
  sale_id?: number
  name?: string
  product?: IProduct
  product_id?: number
  total_price: number
  total_tax: number
  quantity: number
}
