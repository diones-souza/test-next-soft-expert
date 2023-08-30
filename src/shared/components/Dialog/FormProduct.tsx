import React, {
  PropsWithChildren,
  useEffect,
  useState,
  forwardRef,
  ReactElement,
  Ref
} from 'react'
import type { NextPage } from 'next'
import {
  TextField,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  Dialog,
  DialogProps,
  Box,
  Divider,
  Grid,
  Autocomplete
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import * as yup from 'yup'
import api from '../../services/api'
import { IProduct, IType } from '../../types'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

type FormProductProps = PropsWithChildren<DialogProps> & {
  onClose: () => void
  onSave: (message: string, status: string) => void
}

const FormProduct: NextPage<FormProductProps> = ({ open, onClose, onSave }) => {
  const cleanData: IProduct = {
    name: '',
    price: 0,
    type_id: 0
  }

  const [isOpen, setIsOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [types, setTypes] = useState<IType[]>([])

  const [customerData, setCustomerData] = useState(cleanData)

  const [errors, setErrors] = useState(cleanData)

  useEffect(() => {
    if (open) {
      setIsOpen(true)
      fetchData()
    }
  }, [open])

  const fetchData = () => {
    api.get('products/types').then(({ data: { data } }) => {
      setTypes(data)
      console.log(data)
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsLoading(false)
    setCustomerData(cleanData)
    setErrors(cleanData)
    onClose()
  }

  const handleChange = (event: any) => {
    const { name, value } = event.target

    setCustomerData(prevData => ({
      ...prevData,
      [name]: value
    }))

    setErrors(prevData => ({
      ...prevData,
      [name]: ''
    }))
  }

  const validateForm = async () => {
    try {
      const schema = yup.object().shape({
        name: yup.string().required(),
        price: yup.number().required()
      })

      await schema.validate(customerData, { abortEarly: false })

      handleSave()
    } catch (validationErrors: any) {
      const errors: any = {}
      validationErrors.inner.forEach((error: any) => {
        errors[error.path] = error.message
      })
      setErrors(errors)
    }
  }

  const handleSave = () => {
    setIsLoading(true)
    api
      .post('products/create', customerData)
      .then(({ data }) => {
        handleClose()
        onSave(data?.message, 'success')
      })
      .catch(error => {
        const message = error?.response?.data ?? error?.message
        onSave(
          typeof message === 'string' ? message : JSON.stringify(message),
          'error'
        )
        setIsLoading(false)
      })
  }

  return (
    <div>
      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{'New Product'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Box component="form" m={2} noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Name"
                  name="name"
                  type="text"
                  defaultValue={customerData.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  defaultValue={customerData.price}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={Boolean(errors.price)}
                  helperText={errors.price == 0 ? '' : errors.price}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={types}
                  getOptionLabel={option => `${option?.id} - ${option?.name}`}
                  onChange={(event, value) =>
                    setCustomerData(prevData => ({
                      ...prevData,
                      type_id: value?.id
                    }))
                  }
                  renderInput={params => <TextField {...params} label="Type" />}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button disabled={isLoading} onClick={handleClose} variant="text">
            Cancel
          </Button>
          <LoadingButton
            loading={isLoading}
            onClick={validateForm}
            variant="contained"
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export { FormProduct }
