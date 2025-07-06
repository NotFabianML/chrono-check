'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NoCheckRow } from './NoCheckRow';
import { Button } from './ui/button';

// Nuevo tipo de dato que incluye el dorsal
export type NoCheckCorredor = {
  dorsal: string;
  identificacion: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  categoria: string | null;
  tipo_licencia: string;
  verificado_federacion: string; // En CSV viene como string 'true'/'false'
};

interface NoCheckDashboardProps {
  corredores: NoCheckCorredor[]; // Recibe los corredores como una prop
}

export function NoCheckDashboard({ corredores }: NoCheckDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const totalCorredores = corredores.length;

  const filteredCorredores = corredores.filter(corredor => {
    if (!corredor) return false;
    const term = searchTerm.toLowerCase();
    const nombreCompleto = `${corredor.nombre || ''} ${corredor.apellido1 || ''} ${corredor.apellido2 || ''}`.toLowerCase();
    const identificacion = (corredor.identificacion || '').toLowerCase();
    const dorsal = (corredor.dorsal || '').toLowerCase();
    return nombreCompleto.includes(term) || identificacion.includes(term) || dorsal.includes(term);
  });

  return (
    <div className="p-4 md:p-8 mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">No Check</h1>
        <div className="flex items-center gap-4 text-lg">

          <span className='font-semibold'>Total: {totalCorredores}</span>
        </div>
      </div>
      <div className="mb-4 flex gap-6">
        <Input
          placeholder="Buscar por nombre, cédula o dorsal..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button asChild className='bg-green-600 hover:bg-green-700'>
          <a href="/" className="text-white">Volver a Dashboard</a>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dorsal</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo Licencia</TableHead>
              <TableHead>Verificado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCorredores.map((corredor, index) => (
              <NoCheckRow key={`${corredor.identificacion}-${index}`} corredor={corredor} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}