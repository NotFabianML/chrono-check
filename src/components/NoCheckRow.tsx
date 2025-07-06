import React from 'react';
import type { NoCheckCorredor } from './NoCheckDashboard'; // Crearemos este tipo en el siguiente paso
import { TableRow, TableCell } from '@/components/ui/table';

interface NoCheckRowProps {
  corredor: NoCheckCorredor;
}

export const NoCheckRow = React.memo(({ corredor }: NoCheckRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-bold">{corredor.dorsal}</TableCell>
      <TableCell>{corredor.identificacion || 'N/A'}</TableCell>
      <TableCell>{`${corredor.nombre} ${corredor.apellido1} ${corredor.apellido2 || ''}`}</TableCell>
      <TableCell>{corredor.categoria || 'N/A'}</TableCell>
      <TableCell>{corredor.tipo_licencia}</TableCell>
      <TableCell>{corredor.verificado_federacion == "False"? "❌" : "✅"}</TableCell>
    </TableRow>
  );
});