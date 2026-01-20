import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ErrorDisplay from '@/components/ui/ErrorDisplay.vue';
import { ErrorSeverity, ErrorCode } from '@/lib/errorHandler';

describe('ErrorDisplay.vue', () => {
  describe('rendering', () => {
    it('should render error message', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Test error message',
        },
      });

      expect(wrapper.text()).toContain('Test error message');
    });

    it('should render action when provided', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          action: 'Please try again',
        },
      });

      expect(wrapper.text()).toContain('Please try again');
    });

    it('should render error code when showCode is true', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          code: ErrorCode.VALIDATION_ERROR,
          showCode: true,
        },
      });

      expect(wrapper.text()).toContain('Code: 4000');
    });

    it('should not render error code when showCode is false', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          code: ErrorCode.VALIDATION_ERROR,
          showCode: false,
        },
      });

      expect(wrapper.text()).not.toContain('Code:');
    });

    it('should render dismiss button when dismissible is true', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          dismissible: true,
        },
      });

      const dismissButton = wrapper.find('button[aria-label="Dismiss"]');
      expect(dismissButton.exists()).toBe(true);
    });

    it('should not render dismiss button when dismissible is false', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          dismissible: false,
        },
      });

      const dismissButton = wrapper.find('button[aria-label="Dismiss"]');
      expect(dismissButton.exists()).toBe(false);
    });

    it('should render action as button when actionAsButton is true', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          action: 'Click me',
          actionAsButton: true,
          actionButtonText: 'Retry',
        },
      });

      const actionButton = wrapper.find('button');
      expect(actionButton.text()).toBe('Retry');
    });

    it('should render action as text when actionAsButton is false', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          action: 'Please try again',
          actionAsButton: false,
        },
      });

      const paragraphs = wrapper.findAll('p');
      const actionParagraph = paragraphs.find(p => p.text().includes('Please try again'));
      expect(actionParagraph).toBeDefined();
    });
  });

  describe('severity styling', () => {
    it('should apply info styling', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Info message',
          severity: ErrorSeverity.Info,
        },
      });

      const container = wrapper.find('div[role="alert"]');
      expect(container.classes().join(' ')).toContain('blue');
    });

    it('should apply warning styling', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Warning message',
          severity: ErrorSeverity.Warning,
        },
      });

      const container = wrapper.find('div[role="alert"]');
      expect(container.classes().join(' ')).toContain('yellow');
    });

    it('should apply error styling', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error message',
          severity: ErrorSeverity.Error,
        },
      });

      const container = wrapper.find('div[role="alert"]');
      expect(container.classes().join(' ')).toContain('red');
    });

    it('should apply critical styling', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Critical message',
          severity: ErrorSeverity.Critical,
        },
      });

      const container = wrapper.find('div[role="alert"]');
      expect(container.classes().join(' ')).toContain('red');
      // Critical should have border-2
      expect(container.classes()).toContain('border-2');
    });
  });

  describe('compact mode', () => {
    it('should apply compact styling when compact is true', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          compact: true,
        },
      });

      const container = wrapper.find('div[role="alert"]');
      expect(container.classes()).toContain('p-2');
      expect(container.classes()).toContain('rounded-md');
    });

    it('should apply regular styling when compact is false', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          compact: false,
        },
      });

      const container = wrapper.find('div[role="alert"]');
      expect(container.classes()).toContain('p-3');
      expect(container.classes()).toContain('rounded-lg');
    });
  });

  describe('icons', () => {
    it('should render info icon for info severity', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Info',
          severity: ErrorSeverity.Info,
        },
      });

      const svg = wrapper.find('svg');
      expect(svg.exists()).toBe(true);
      // Info icon has a circle with info in it
      expect(svg.html()).toContain('M13 16h-1v-4h-1m1-4h.01');
    });

    it('should render warning icon for warning severity', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Warning',
          severity: ErrorSeverity.Warning,
        },
      });

      const svg = wrapper.find('svg');
      expect(svg.exists()).toBe(true);
      // Warning icon is a triangle
      expect(svg.html()).toContain('M12 9v2m0 4h.01');
    });

    it('should render error icon for error severity', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          severity: ErrorSeverity.Error,
        },
      });

      const svg = wrapper.find('svg');
      expect(svg.exists()).toBe(true);
      // Error icon is an X in a circle
      expect(svg.html()).toContain('M10 14l2-2m0 0l2-2');
    });
  });

  describe('events', () => {
    it('should emit dismiss event when dismiss button clicked', async () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          dismissible: true,
        },
      });

      const dismissButton = wrapper.find('button[aria-label="Dismiss"]');
      await dismissButton.trigger('click');

      expect(wrapper.emitted('dismiss')).toBeTruthy();
      expect(wrapper.emitted('dismiss')).toHaveLength(1);
    });

    it('should emit action event when action button clicked', async () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          action: 'Retry',
          actionAsButton: true,
        },
      });

      // Find the action button (not the dismiss button)
      const buttons = wrapper.findAll('button');
      const actionButton = buttons.find(b => b.text().includes('Try Again'));
      expect(actionButton).toBeDefined();

      await actionButton!.trigger('click');

      expect(wrapper.emitted('action')).toBeTruthy();
      expect(wrapper.emitted('action')).toHaveLength(1);
    });
  });

  describe('accessibility', () => {
    it('should have role="alert"', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
        },
      });

      const container = wrapper.find('[role="alert"]');
      expect(container.exists()).toBe(true);
    });

    it('should have aria-live="assertive"', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
        },
      });

      const container = wrapper.find('[aria-live="assertive"]');
      expect(container.exists()).toBe(true);
    });

    it('should have aria-label on dismiss button', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          dismissible: true,
        },
      });

      const dismissButton = wrapper.find('button[aria-label="Dismiss"]');
      expect(dismissButton.exists()).toBe(true);
    });
  });

  describe('default props', () => {
    it('should default to Error severity', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
        },
      });

      const container = wrapper.find('div[role="alert"]');
      expect(container.classes().join(' ')).toContain('red');
    });

    it('should default dismissible to true', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
        },
      });

      const dismissButton = wrapper.find('button[aria-label="Dismiss"]');
      expect(dismissButton.exists()).toBe(true);
    });

    it('should default showCode to false', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          code: ErrorCode.NETWORK_ERROR,
        },
      });

      expect(wrapper.text()).not.toContain('Code:');
    });

    it('should default compact to false', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
        },
      });

      const container = wrapper.find('div[role="alert"]');
      expect(container.classes()).toContain('p-3');
    });

    it('should default actionButtonText to "Try Again"', () => {
      const wrapper = mount(ErrorDisplay, {
        props: {
          message: 'Error',
          action: 'Do something',
          actionAsButton: true,
        },
      });

      expect(wrapper.text()).toContain('Try Again');
    });
  });
});
