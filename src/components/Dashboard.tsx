'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { CorredorRow } from './CorredorRow'; 
import Papa from 'papaparse'; 

// Importar componentes de ShadCN
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './ui/button';


// Definir el tipo de dato para un corredor
export type Corredor = {
  id: number;
  created_at: string;
  identificacion: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  categoria: string | null;
  tipo_licencia: string;
  verificado_federacion: boolean;
};

// Crear una única instancia del cliente de Supabase
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const channel = supabase.channel('corredores-updates');

export function Dashboard() {
  const [corredores, setCorredores] = useState<Corredor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingCorredor, setConfirmingCorredor] = useState<Corredor | null>(null);

  // --- EFECTO PARA CARGAR DATOS ---
  useEffect(() => {
    async function getCorredores() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('corredores')
          .select('*')
          .order('nombre', { ascending: true })
          .order('apellido1', { ascending: true });

        if (error) throw error;
        if (data) setCorredores(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    getCorredores();
  }, []);

  // --- EFECTO PARA REAL-TIME ---
  useEffect(() => {
    const channel = supabase.channel('corredores-updates');

    channel
      .on('broadcast', { event: 'corredor-updated' }, ({ payload }) => {
        console.log('✅ Cambio en tiempo real recibido:', payload);
        setCorredores(currentCorredores =>
          currentCorredores.map(c =>
            c.id === payload.updatedCorredor.id ? payload.updatedCorredor : c
          )
        );
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado al canal de tiempo real.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDownloadCSV = () => {
    toast.info("Generando archivo CSV...");

    const dataParaCSV = corredores.map(corredor => ({
      ...corredor,
      identificacion: `${corredor.identificacion}`
    }));

    const csv = Papa.unparse(dataParaCSV, {
      header: true,
      columns: [
        'identificacion',
        'nombre',
        'apellido1',
        'apellido2',
        'categoria',
        'tipo_licencia',
        'verificado_federacion'
      ]
    });

    // Lógica para crear y descargar el archivo
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_corredores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCorredores = corredores.filter(corredor => {
    const term = searchTerm.toLowerCase();
    const nombreCompleto = `${corredor.nombre} ${corredor.apellido1} ${corredor.apellido2 || ''}`.toLowerCase();
    const identificacion = corredor.identificacion.toLowerCase();
    return nombreCompleto.includes(term) || identificacion.includes(term);
  });

  const handleUpdateCorredor = useCallback(async (
    corredorId: number,
    updates: Partial<Omit<Corredor, 'id'>>
  ) => {
    setCorredores(currentCorredores => {
      const corredorActualizado = currentCorredores.find(c => c.id === corredorId)!;
      const corredorConUpdates = { ...corredorActualizado, ...updates };

      // Transmisión instantánea
      channel.send({
        type: 'broadcast',
        event: 'corredor-updated',
        payload: { updatedCorredor: corredorConUpdates },
      });

      // Actualización optimista en la UI
      return currentCorredores.map(c => (c.id === corredorId ? corredorConUpdates : c));
    });

    // Se envía la actualización a la base de datos en segundo plano
    const { error } = await supabase
      .from('corredores')
      .update(updates)
      .eq('id', corredorId);

    if (error) {
      console.error("Error al actualizar:", error.message);
      alert("No se pudo guardar el cambio. El estado se revertirá.");
      setCorredores(currentCorredores => {
        const originalCorredor = currentCorredores.find(c => c.id === corredorId)!;
        const revertedField = Object.keys(updates)[0] as keyof typeof updates;
        const revertedCorredor = { ...originalCorredor, [revertedField]: !updates[revertedField] };
        return currentCorredores.map(c => c.id === corredorId ? revertedCorredor : c);
      });
      toast.error("No se pudo guardar el cambio.");
    } else {
      toast.success("Cambio guardado correctamente.");
    }
  }, []);

  const totalCorredores = corredores.length;
  const totalVerificados = corredores.filter(c => c.verificado_federacion).length;
  const totalFaltantes = totalCorredores - totalVerificados;

  if (loading) return <div className="text-center p-8">Cargando corredores...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 md:p-8 mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">ChronoCheck</h1>
        <div className="flex items-center gap-4 text-lg">
          <span className="font-semibold">Progreso:</span>
          <span className="text-green-600 font-bold">Verificados: {totalVerificados}</span>
          <span className="text-orange-600 font-bold">Faltan: {totalFaltantes}</span>
          <span>Total: {totalCorredores}</span>
        </div>
      </div>

      <div className="mb-4 flex gap-6">
        <Input
          placeholder="Buscar por nombre, cédula..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleDownloadCSV}>
          Descargar CSV
        </Button>
        <Button asChild className='bg-green-600 hover:bg-green-700'>
          <a href="/no-check" className="text-white">Ver lista No-Check</a>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Verificado Fed.</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Tipo Licencia</TableHead>
              <TableHead>Categoría</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCorredores.map((corredor) => (
              <CorredorRow
                key={corredor.id}
                corredor={corredor}
                onUpdate={handleUpdateCorredor}
                confirmingCorredor={confirmingCorredor}
                onConfirmVerification={setConfirmingCorredor}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}