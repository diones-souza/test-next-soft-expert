import { NextPage } from 'next'
import React, { useContext, useEffect, useState } from 'react'
import { CustomNoRowsOverlay, UserContent } from '../../shared/components'
import Head from 'next/head'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardHeader,
  Grid,
  LinearProgress,
  TextField,
  Typography
} from '@mui/material'
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { IProduct, ISaleProduct } from '../../shared/types'
import api from '../../shared/services/api'
import { AuthContext } from '../../shared/contexts'

const Page: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false)

  const [item, setItem] = useState<IProduct | null>(null)

  const [quantity, setQuantity] = useState<number>(1)

  const [items, setItems] = useState<ISaleProduct[]>([])

  const [products, setProducts] = useState<IProduct[]>([])

  const { handleOpenNotify } = useContext(AuthContext)

  const rows: GridRowsProp = items

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Código', align: 'center' },
    { field: 'name', headerName: 'Name', width: 120 },
    { field: 'quantity', headerName: 'QTD', editable: true },
    { field: 'price', headerName: 'Price' },
    { field: 'total_tax', headerName: 'Tax %' },
    { field: 'total', headerName: 'Total $' }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    api.get('products').then(({ data: { data } }) => {
      setProducts(data)
    })
  }

  const handleAdd = () => {
    setItems(prevData => [
      ...prevData,
      {
        ...item,
        product_id: item?.id,
        quantity,
        total_tax: item?.total_tax ?? 0,
        total_price: quantity * (item?.price ?? 0)
      }
    ])

    setItem(null)
    setQuantity(1)
  }

  const handleTotal = () => {
    const value = items
      .map(item => item.total_price)
      .reduce((acc, currentValue) => acc + currentValue, 0)

    const tax = items
      .map(item => item.total_tax)
      .reduce((acc, currentValue) => acc + currentValue, 0)

    const total_tax = (tax / 100) * value

    return value + total_tax
  }

  const handleSave = () => {
    setIsLoading(true)

    const data = items.map(item => {
      return {
        product_id: item.product_id,
        quantity: item.quantity
      }
    })

    api
      .post('sales/create', {
        items: data
      })
      .then(({ data }) => {
        setItems([])
        handleOpenNotify({
          open: true,
          message: data.message,
          color: 'success',
          icon: <CheckCircleIcon />
        })
      })
      .catch(error => {
        const message = error?.response?.data ?? error?.message

        handleOpenNotify({
          open: true,
          message:
            typeof message === 'string' ? message : JSON.stringify(message),
          color: 'error',
          icon: <ErrorIcon />
        })

        setIsLoading(false)
      })
  }

  return (
    <UserContent>
      <Head>
        <title>PDV</title>
      </Head>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow:
                '0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important'
            }}
          >
            <CardHeader
              title={<Typography variant="subtitle1">Add Products</Typography>}
            />
            <Box component="form" m={2} noValidate autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={quantity}
                    onChange={event =>
                      setQuantity(parseFloat(event.target.value))
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    options={products}
                    getOptionLabel={option => option.name}
                    onChange={(event, value: any) => setItem(value)}
                    fullWidth
                    value={item}
                    renderInput={params => (
                      <TextField {...params} label="Add Product" />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h5">{item?.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="overline">Unitary value</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">${item?.price ?? 0}</Typography>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                  <Button onClick={handleAdd} variant="contained">
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={7}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow:
                '0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important'
            }}
          >
            <CardHeader
              title={<Typography variant="subtitle1">List Products</Typography>}
            />
            <Box style={{ height: '50vh' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                disableSelectionOnClick
                editMode="cell"
                components={{
                  LoadingOverlay: LinearProgress,
                  NoRowsOverlay: CustomNoRowsOverlay
                }}
              />
            </Box>
            <Grid container p={2} spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1">
                  Quantity:{' '}
                  {items
                    .map(item => item.quantity)
                    .reduce((acc, currentValue) => acc + currentValue, 0)}
                </Typography>
                <Typography variant="subtitle1">
                  Subtotal:{' $'}
                  {items
                    .map(item => item?.total_price)
                    .reduce((acc, currentValue) => acc + currentValue, 0)}
                </Typography>
                <Typography variant="subtitle1">
                  Tax:{' '}
                  {items
                    .map(item => item?.total_tax)
                    .reduce((acc, currentValue) => acc + currentValue, 0)}
                  {'%'}
                </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <Box sx={{ textAlign: 'end' }}>
                  <Typography variant="h4">Total</Typography>
                  <Typography variant="h4">${handleTotal()}</Typography>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Button variant="text">Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                  Save
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </UserContent>
  )
}

export default Page
