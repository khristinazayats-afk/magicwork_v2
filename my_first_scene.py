from manim import *

class CircleAndSquare(Scene):
    def construct(self):
        # Create a red circle
        circle = Circle(radius=1.5, color=RED, fill_opacity=0.8)
        circle.shift(LEFT * 2)
        
        # Create a blue square
        square = Square(side_length=2, color=BLUE, fill_opacity=0.8)
        square.shift(RIGHT * 2)
        
        # Add title
        title = Text("Red Circle & Blue Square", font_size=36)
        title.to_edge(UP)
        
        # Animate them appearing
        self.play(Write(title))
        self.wait(0.5)
        
        self.play(
            FadeIn(circle, scale=0.5),
            FadeIn(square, scale=0.5),
            run_time=1.5
        )
        
        self.wait(1)
        
        # Make them dance a bit
        self.play(
            circle.animate.shift(UP * 0.5),
            square.animate.shift(DOWN * 0.5),
            run_time=0.8
        )
        
        self.play(
            circle.animate.shift(DOWN * 0.5),
            square.animate.shift(UP * 0.5),
            run_time=0.8
        )
        
        self.wait(1)










