import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { useEmpreendimentos } from '../hooks/useEmpreendimentos';
import { QueryError } from '../components/common/QueryError';
import { EMPREENDIMENTO_FASE_LABELS, EMPREENDIMENTO_TIPO_LABELS } from '../constants/enums';

const markerIcon = new L.Icon({
  iconUrl: '/icons/icon-192.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'rounded-full',
});

const DEFAULT_CENTER: [number, number] = [-15.793889, -47.882778]; // Brasília, fallback sem nenhum endereço cadastrado

export function MapaPage() {
  const { data, isLoading, isError, error, refetch } = useEmpreendimentos();
  const empreendimentos = data?.empreendimentos ?? [];
  const comLocalizacao = empreendimentos.filter((e) => e.latitude != null && e.longitude != null);

  if (isError) return <QueryError error={error} onRetry={refetch} />;
  if (isLoading) return <p className="text-sm text-slate-500 dark:text-slate-400">Carregando mapa...</p>;

  const center: [number, number] = comLocalizacao[0]
    ? [comLocalizacao[0].latitude!, comLocalizacao[0].longitude!]
    : DEFAULT_CENTER;

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-800 dark:text-slate-100">Mapa dos Empreendimentos</h1>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        {comLocalizacao.length === 0
          ? 'Nenhum empreendimento com endereço cadastrado ainda. Adicione um endereço na tela de Empreendimentos para ele aparecer aqui.'
          : `${comLocalizacao.length} de ${empreendimentos.length} empreendimento(s) com localização.`}
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700" style={{ height: '70vh' }}>
        <MapContainer center={center} zoom={comLocalizacao.length ? 13 : 4} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {comLocalizacao.map((e) => (
            <Marker key={e.id} position={[e.latitude!, e.longitude!]} icon={markerIcon}>
              <Popup>
                <p className="font-semibold">{e.nome}</p>
                <p className="text-xs text-slate-500">{EMPREENDIMENTO_TIPO_LABELS[e.tipo]} · {EMPREENDIMENTO_FASE_LABELS[e.fase_atual]}</p>
                {e.endereco && <p className="mt-1 text-xs">{e.endereco}</p>}
                <Link to={`/tarefas?empreendimento_id=${e.id}`} className="mt-1 block text-xs font-medium text-brand-700 underline">
                  Ver tarefas
                </Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
