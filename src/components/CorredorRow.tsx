import React from 'react';
import type { Corredor } from './Dashboard';

// Importamos los componentes de UI que necesita esta fila
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Definimos las props que recibirá el componente
interface CorredorRowProps {
  corredor: Corredor;
  onUpdate: (corredorId: number, updates: Partial<Omit<Corredor, 'id'>>) => void;
  confirmingCorredor: Corredor | null;
  onConfirmVerification: (corredor: Corredor | null) => void;
}

// Usamos React.memo para evitar re-renderizados innecesarios
export const CorredorRow = React.memo(({ corredor, onUpdate, confirmingCorredor, onConfirmVerification }: CorredorRowProps) => {
  console.log(`Renderizando fila para: ${corredor.nombre}`);
  const handleConfirm = () => {
    onUpdate(corredor.id, { verificado_federacion: false });
    onConfirmVerification(null); // Cierra el diálogo
  };

  const handleCheckboxClick = () => {
    if (!corredor.verificado_federacion) {
      // Si ya está verificado, permite desmarcarlo sin confirmación
      onUpdate(corredor.id, { verificado_federacion: true });
    } else {
      // Si no está verificado, abre el diálogo de confirmación
      onConfirmVerification(corredor);
    }
  };

  return (
    <>
      <TableRow key={corredor.id}>
        <TableCell className="text-center">
          <Checkbox
            checked={corredor.verificado_federacion}
            onCheckedChange={(nuevoEstado) => {
              onUpdate(corredor.id, { verificado_federacion: !!nuevoEstado });
            }}
            // onClick={handleCheckboxClick}
          />
        </TableCell>
        <TableCell>{corredor.identificacion}</TableCell>
        <TableCell className="font-medium">{`${corredor.nombre} ${corredor.apellido1} ${corredor.apellido2 || ''}`}</TableCell>
        <TableCell>
          <Select
            value={corredor.tipo_licencia || ''}
            onValueChange={(nuevoValor) => {
              onUpdate(corredor.id, { tipo_licencia: nuevoValor });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ANUAL">Anual</SelectItem>
              <SelectItem value="1DIA">1 Día</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>{corredor.categoria || 'N/A'}</TableCell>
      </TableRow>

      <AlertDialog
        open={confirmingCorredor?.id === corredor.id}
        onOpenChange={() => onConfirmVerification(null)} // Cierra si se hace clic fuera
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Quitar verificado al corredor <span className="font-bold">{corredor.nombre} {corredor.apellido1}</span> - <span className="font-bold">{corredor.identificacion}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});