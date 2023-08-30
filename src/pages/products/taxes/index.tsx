import React, { useContext, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useFetch } from '../../../shared/hooks/useFetch'
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridCellEditCommitParams
} from '@mui/x-data-grid'
import { LinearProgress, Stack, Button } from '@mui/material'
import {
  CustomNoRowsOverlay,
  FormTax,
  UserContent
} from '../../../shared/components'
import Head from 'next/head'
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material'
import api from '../../../shared/services/api'
import { LoadingButton } from '@mui/lab'
import { AuthContext } from '../../../shared/contexts'
import { ITax } from '../../../shared/types'

interface IResponse {
  data: ITax[]
  message: string
  statusCode: number
}

const Page: NextPage = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState(false)

  const [selectedRows, setSelectedRows] = useState<any[]>([])

  const { data, error, isValidating, mutate } =
    useFetch<IResponse>('products/taxes')

  const { handleOpenNotify } = useContext(AuthContext)

  const rows: GridRowsProp = data?.data || []

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Código', align: 'center', width: 90 },
    { field: 'name', headerName: 'Name', width: 200, editable: true },
    { field: 'rate', headerName: 'Tax %', width: 150, editable: true },
    { field: 'created_at', headerName: 'Created', width: 250 }
  ]

  useEffect(() => {
    if (error) {
      handleOpenNotify({
        open: true,
        message: error.message,
        color: 'error',
        icon: <ErrorIcon />
      })
    }

    if (openDialog) {
      setOpenDialog(true)
    }
  }, [error, openDialog])

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleSelectionChange = (selection: any[]) => {
    setSelectedRows(selection)
  }

  const handleSave = (message: string, status: string) => {
    mutate()

    handleOpenNotify({
      open: true,
      message,
      color: status,
      icon: status === 'success' ? <CheckCircleIcon /> : <ErrorIcon />
    })
  }

  const handleUpdade = (params: GridCellEditCommitParams) => {
    const { id, field, value } = params

    const row: ITax = rows.find(row => row.id === id)

    const updateRow: ITax = {
      ...row,
      [field]: value
    }

    delete updateRow.id
    delete updateRow.created_at

    api
      .put(`products/taxes/update/${id}`, updateRow)
      .then(({ data }) => {
        mutate()

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
      })
  }

  const handleDelete = async () => {
    setIsLoading(true)

    const erros: string[] = []

    for (const id of selectedRows) {
      await api
        .delete(`products/taxes/delete/${id}`, { data: { id } })
        .catch(error => {
          const message = error?.response?.data ?? error?.message

          erros.push(
            typeof message === 'string' ? message : JSON.stringify(message)
          )
        })
    }

    if (!erros.length) {
      handleOpenNotify({
        open: true,
        message: 'Success',
        color: 'success',
        icon: <CheckCircleIcon />
      })
    } else {
      handleOpenNotify({
        open: true,
        message: erros.join(', '),
        color: 'error',
        icon: <ErrorIcon />
      })
    }

    setIsLoading(false)

    mutate()

    setSelectedRows([])
  }

  return (
    <UserContent>
      <Head>
        <title>Product Taxes</title>
      </Head>
      <FormTax
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />
      <>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
          sx={{ margin: '8px' }}
        >
          {selectedRows.length > 0 && (
            <LoadingButton
              loading={isLoading}
              onClick={handleDelete}
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Excluir
            </LoadingButton>
          )}
          <Button
            onClick={handleOpenDialog}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Novo
          </Button>
        </Stack>
        <div style={{ height: '70vh' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isValidating}
            disableSelectionOnClick
            checkboxSelection
            onSelectionModelChange={handleSelectionChange}
            selectionModel={selectedRows}
            editMode="cell"
            onCellEditCommit={handleUpdade}
            components={{
              LoadingOverlay: LinearProgress,
              NoRowsOverlay: CustomNoRowsOverlay
            }}
          />
        </div>
      </>
    </UserContent>
  )
}

export default Page
