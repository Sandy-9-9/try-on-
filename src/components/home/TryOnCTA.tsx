import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Wand2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Camera,
    title: 'Upload Your Photo',
    description: 'Take a photo or upload an existing one',
  },
  {
    icon: Wand2,
    title: 'AI Magic',
    description: 'Our AI visualizes clothes on you',
  },
  {
    icon: ShoppingBag,
    title: 'Shop with Confidence',
    description: 'Buy what looks perfect on you',
  },
];

export function TryOnCTA() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Virtual Try-On Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our revolutionary AI technology makes online shopping as confident as in-store shopping.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 bg-card rounded-2xl shadow-elegant mb-6">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/try-on">
            <Button size="lg" className="shadow-elegant">
              Try It Now - It's Free
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
