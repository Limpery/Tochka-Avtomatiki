import { TrpcProvider } from "./lib/trpc"
import { AllMemesPage } from "./pages/AllMemesPage"

export const App = () => {
  return (
    <TrpcProvider>
      <AllMemesPage />
    </TrpcProvider>
  )
}