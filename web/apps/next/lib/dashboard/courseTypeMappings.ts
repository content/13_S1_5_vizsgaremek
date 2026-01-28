import { BookMarked, Brain, ChartBarIncreasing, Megaphone, Newspaper } from "lucide-react";


const mappings: Record<string, { icon: React.ComponentType<{ className?: string }>; title: string }> = {
    "ASSIGNMENT": {icon: Newspaper, title: "Beadandó Feladat"},
    "ANNOUNCEMENT": {icon: Megaphone, title: "Közlemény"},
    "RESOURCE": {icon: BookMarked, title: "Tananyag"},
    "QUESTION": {icon: Brain, title: "Kérdés"},
    "POLL": {icon: ChartBarIncreasing, title: "Felmérés"},
}

export default mappings; 