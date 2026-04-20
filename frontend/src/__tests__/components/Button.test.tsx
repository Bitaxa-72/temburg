import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports primary variant', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-primary-dark');
    expect(button).toHaveClass('text-white');
  });

  it('supports accent variant', () => {
    render(<Button variant="accent">Accent</Button>);
    const button = screen.getByText('Accent');
    expect(button).toHaveClass('bg-accent');
    expect(button).toHaveClass('text-white');
  });

  it('supports outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText('Outline');
    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('border-primary-dark');
  });

  it('supports ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByText('Ghost');
    expect(button).toHaveClass('text-primary-dark');
  });

  it('supports different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('px-4', 'py-2', 'text-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText('Medium')).toHaveClass('px-6', 'py-3', 'text-base');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('px-10', 'py-4', 'text-lg');
  });

  it('renders as Link when internal href is provided', () => {
    render(
      <BrowserRouter>
        <Button href="/pricing">Go to Pricing</Button>
      </BrowserRouter>
    );

    const link = screen.getByText('Go to Pricing');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('renders as anchor when external href is provided', () => {
    render(<Button href="https://example.com">External Link</Button>);

    const link = screen.getByText('External Link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('applies disabled styles when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});
