import { redirect } from 'next/navigation'

export default function PrevisionnelIndexPage() {
    // Redirect to the "nouveau" page for creating a new prévisionnel
    redirect('/previsionnel/nouveau')
}
