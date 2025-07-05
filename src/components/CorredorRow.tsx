import React from 'react';
import type { Corredor } from './Dashboard';

// Importamos los componentes de UI que necesita esta fila
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Definimos las props que recibirá el componente
interface CorredorRowProps {
  corredor: Corredor;
  onUpdate: (corredorId: number, updates: Partial<Omit<Corredor, 'id'>>) => void;
}

// Usamos React.memo para evitar re-renderizados innecesarios
export const CorredorRow = React.memo(({ corredor, onUpdate }: CorredorRowProps) => {
  console.log(`Renderizando fila para: ${corredor.nombre}`);

  return (
    <TableRow key={corredor.id}>
      <TableCell className="text-center">
        <Checkbox
          checked={corredor.verificado_federacion}
          onCheckedChange={(nuevoEstado) => {
            onUpdate(corredor.id, { verificado_federacion: !!nuevoEstado });
          }}
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
  );
});