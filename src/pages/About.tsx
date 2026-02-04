import { motion } from 'framer-motion';
import { Sparkles, Heart, Shield, Truck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Try-On',
    description: 'Our cutting-edge AI technology lets you see exactly how clothes will look on you before you buy.',
  },
  {
    icon: Heart,
    title: 'Curated Collection',
    description: 'Every piece in our collection is carefully selected for quality, style, and timelessness.',
  },
  {
    icon: Shield,
    title: 'Secure Shopping',
    description: 'Shop with confidence knowing your data and transactions are protected with industry-leading security.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free express shipping on orders over $100. Easy returns within 30 days.',
  },
];

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Redefining How You
            <span className="block text-gradient-rose">Shop for Fashion</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Attire combines cutting-edge AI technology with premium fashion to create 
            a shopping experience that's as confident as trying on clothes in person.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center mb-20"
        >
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-muted-foreground mb-4">
              We believe everyone deserves to shop with confidence. Traditional online shopping 
              often leads to disappointment – clothes that look amazing in photos don't always 
              match expectations when they arrive.
            </p>
            <p className="text-muted-foreground">
              That's why we created Attire. Our AI-powered virtual try-on technology bridges 
              the gap between online and in-store shopping, helping you make decisions you'll 
              love.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
              alt="Fashion studio"
              className="rounded-2xl shadow-elegant"
            />
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            Why Choose Attire
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-secondary/50 rounded-2xl p-12"
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Experience the Future of Fashion?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of happy customers who shop smarter with Attire.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default About;
