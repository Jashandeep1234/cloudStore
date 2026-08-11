import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbNavProps {
  items: { label: string; href?: string }[];
}

export const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/drive" className="flex items-center">
              <Home className="w-4 h-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.length > 0 && <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2.5">
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="font-medium text-foreground">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
