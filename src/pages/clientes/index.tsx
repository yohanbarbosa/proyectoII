import { ContactModule } from '../proveedores/ContactModule'
export default function ClientesModule() {
  return <ContactModule table="clientes" pk="id_cliente" title="Clientes" icon="◎" singular="Cliente" />
}
