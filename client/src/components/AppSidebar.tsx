
import { Link, useLocation } from 'react-router-dom';
import { Code, List, BarChart3 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import logoA2Z from '@assets/476284185_9672782622732554_7779269226472463925_n (1)_1751931917903.jpg';

export function AppSidebar() {
  const location = useLocation();

  const menuItems = [
    {
      href: '/',
      label: 'Gerador',
      icon: Code,
    },
    {
      href: '/codes',
      label: 'Códigos Salvos',
      icon: List,
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-white/20 dark:border-gray-700/30">
        <div className="flex flex-col items-center p-6">
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 p-3 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg">
              <img 
                src={logoA2Z} 
                alt="A2Z Projetos" 
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Menu</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 p-4">
        <SidebarMenu className="space-y-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={item.label}
                className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 transition-all duration-200 rounded-xl data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-purple-100 dark:data-[active=true]:from-blue-900/40 dark:data-[active=true]:to-purple-900/40"
              >
                <Link to={item.href} className="flex items-center gap-3 p-3">
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
