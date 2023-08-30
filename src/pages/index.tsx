import React, { useContext, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { AuthContext } from '../shared/contexts'
import { useRouter } from 'next/router'
import { UserContent } from '../shared/contents'
import Head from 'next/head'
import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Unstable_Grid2 as Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import Chart from 'react-google-charts'
import moment from 'moment'
import api from '../shared/services/api'
import { IProduct, ISale, IUser } from '../shared/types'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { CustomNoRowsOverlay } from '../shared/components'

const Dashboard: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [sales, setSales] = useState<ISale[]>([])

  const [users, setUsers] = useState<IUser[]>([])

  const [products, setProducts] = useState<IProduct[]>([])

  const [chartData, setChartData] = useState<any[]>([])

  const rows: GridRowsProp = sales || []

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Código', align: 'center', width: 90 },
    { field: 'total_price', headerName: 'Total', width: 200, editable: true },
    {
      field: 'total_tax',
      headerName: 'Total Tax %',
      width: 150,
      editable: true
    },
    { field: 'created_at', headerName: 'Created', width: 250 }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (sales.length) loadChartData()
  }, [sales])

  const fetchData = async () => {
    setIsLoading(true)

    await api.get('sales').then(({ data: { data } }) => {
      setSales(data)
    })

    await api.get('users').then(({ data: { data } }) => {
      setUsers(data)
    })

    await api.get('products').then(({ data: { data } }) => {
      setProducts(data)
    })

    setIsLoading(false)
  }

  const loadChartData = () => {
    const data: ISale[] = sales

    const today = moment().startOf('day')

    let chartData = []

    for (let i = 6; i >= 0; i--) {
      const date = moment(today).subtract(i, 'days')

      const quantity = data.filter((item: any) =>
        moment(item.created_at).isSame(date, 'day')
      ).length
      chartData.push({
        day: date.format('ddd'),
        quantity
      })
    }

    const dailyData: { [key: string]: any } = chartData?.reduce(
      (result: any, item) => {
        if (!result[item.day]) {
          result[item.day] = {
            ...item
          }
        }

        return result
      },
      {}
    )

    chartData = Object.values(dailyData).map(({ day, quantity }) => [
      day,
      quantity
    ])

    setChartData([['Day', 'Quantity'], ...chartData])
  }

  return (
    <UserContent>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Box>
        <Typography variant="h4">Bem-vindo ao Dashboard</Typography>
        <Typography variant="subtitle2">
          Este é o painel de controle para visualizar informações importantes do
          seu aplicativo.
        </Typography>
      </Box>
      <Box
        sx={{
          '& .MuiGrid2-root': { p: 1 }
        }}
      >
        <Grid container>
          <Grid xs={4}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow:
                  '0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important',
                height: '150px'
              }}
            >
              <CardHeader
                title={<Typography variant="subtitle1">Total Users</Typography>}
              />
              <Typography variant="h3" align="center" color="#3366cc">
                {users?.length}
              </Typography>
            </Card>
          </Grid>
          <Grid xs={4}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow:
                  '0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important',
                height: '150px'
              }}
            >
              <CardHeader
                title={
                  <Typography variant="subtitle1">Total Products</Typography>
                }
              />
              <Typography variant="h3" align="center" color="#dc3912">
                {products?.length}
              </Typography>
            </Card>
          </Grid>
          <Grid xs={4}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow:
                  '0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important',
                height: '150px'
              }}
            >
              <div>
                <CardHeader
                  title={
                    <Typography variant="subtitle1">Total Sales</Typography>
                  }
                />
                <Typography variant="h3" align="center" color="#ff9900">
                  {sales?.length}
                </Typography>
              </div>
            </Card>
          </Grid>
          <Grid xs={12}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow:
                  '0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important',
                height: '350px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Chart
                width={'100%'}
                height={'350px'}
                chartType="LineChart"
                loader={<CircularProgress />}
                data={chartData}
                options={{
                  title: 'Recent Sales',
                  isStacked: false,
                  curveType: 'function',
                  legend: {
                    position: 'bottom'
                  }
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <Grid container>
          <Grid xs={12}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow:
                  '0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important',
                height: '517px'
              }}
            >
              <CardHeader
                title={
                  <Typography variant="subtitle1">Recent Sales</Typography>
                }
              />
              <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoading}
                disableSelectionOnClick
                checkboxSelection
                editMode="cell"
                components={{
                  LoadingOverlay: LinearProgress,
                  NoRowsOverlay: CustomNoRowsOverlay
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </UserContent>
  )
}

export default Dashboard
