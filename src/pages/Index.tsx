
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle>Welcome to Your App</CardTitle>
          <CardDescription>The application is working correctly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            This is a basic landing page created with Vite, React, TypeScript, and shadcn/ui components.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Get Started</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
