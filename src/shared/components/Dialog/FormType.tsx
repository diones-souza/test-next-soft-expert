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
import { IType } from '../../types'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

type FormTypeProps = PropsWithChildren<DialogProps> & {
  onClose: () => void
  onSave: (message: string, status: string) => void
}

const FormType: NextPage<FormTypeProps> = ({ open, onClose, onSave }) => {
  const cleanData: IType = {
    name: ''
  }

  const [isOpen, setIsOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [customerData, setCustomerData] = useState(cleanData)

  const [errors, setErrors] = useState(cleanData)

  useEffect(() => {
    if (open) {
      setIsOpen(true)
    }
  }, [open])

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
        name: yup.string().required()
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
      .post('products/types/create', customerData)
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
        <DialogTitle>{'New Type'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Box component="form" m={2} noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12}>
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

export { FormType }
