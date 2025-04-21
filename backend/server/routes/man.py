from manim import *


class BasicAnimation(Scene):
    def construct(self):
        # Create a circle
        circle = Circle(radius=2.0, color=BLUE)

        # Create a square
        square = Square(side_length=2.0, color=GREEN)

        # Create a text
        text = Text("Basic Manim Animation", font_size=36)

        # Position the text at the top
        text.to_edge(UP)

        # Display the text
        self.play(Write(text))

        # Display the circle
        self.play(Create(circle))

        # Transform the circle into a square
        self.play(Transform(circle, square))

        # Fade out all objects
        self.play(FadeOut(circle), FadeOut(text))
